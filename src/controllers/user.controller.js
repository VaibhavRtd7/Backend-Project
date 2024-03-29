import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Mongoose } from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token.",
      error
    );
  }
};

// Register user...
const registerUser = asyncHandler(async (req, res) => {
  // 1. get the use details from  the frontend
  // 2. validation - not empty
  // 3. check if user already exists : username, email
  // 4. check for images, check for avatar
  // 5. upload them to cloudinary, avatar
  // 6. create user object - create entry in db
  // 7. rm password and refresh token from the body
  // return res

  //1. get the use details from  the frontend
  const { fullName, email, username, password } = req.body;

  //2. validation - for not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(500, "All field are required !!");
  }
  // if(fullName === "") throw new ApiError(500, "fullName is required !!")

  //3.check if user already exists : username, email
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with email or username is  already exists !!"
    );
  }

  // 4. check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required !!!");
  }

  // 5. upload them to cloudinary, avatar

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar to cloudinary");
  }

  // 6. create user object - create entry in db

  const createdUser = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // 7. rm password and refresh token from the body
  User.findById(User._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// Login user...
const loginUser = asyncHandler(async (req, res) => {
  // data from req body
  // email or password
  // find the  user
  // check the  password

  // access and refresh token
  // send cookie

  const { email, username, password } = req.body;

  //    console.log("Username :- ", username , "Email :- ", email)
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required!!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  //    console.log("user :--", user);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid password !!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );

  // for cookies
  const options = {
    httpOnly: true, // now only modifiable by server
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

//Logout User...
const logOutUser = asyncHandler(async (req, res) => {
  // console.log('logout hits')
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {                    // unset -> refreshToken : 1
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true, // now cookie is only modifiable by server
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out !!"));
});


// Timeout for AccessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request !!");
  }

  try {

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token !!");
    }
  
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used !!");
    }
  
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
  
    const options = {
      httpOnly: true,
      secure: true,
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookies("refreshToken", newRefreshToken, options)
    .josn(
      new ApiResponse(
          200,
          {
              accessToken , refreshToken : newRefreshToken
          },
          "Access Token Refreshed !!"
      )
    )

  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid Refresh Token")
  }

});


// Change password
const changeCurrentPassword = asyncHandler ( async(req, res) => {
    const { oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id); // req.body
    // console.log("-- oldPassword, newPassword :-----", oldPassword, newPassword);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    

    if(!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }

    user.password =  newPassword;
    await user.save({ validateBeforeSave : false})

    return res.
    status(200).
    json(
      new ApiResponse(
        200,
        {},
        "Password Changed Successfully"
      )
    )

})

// get current user
const getCurrentUser = asyncHandler ( async (req, res) => {
    console.log(req.user)
    return res.status(200).json( new ApiResponse ( 200, req.user, "current user fetch"))
})

//upadate account details
const updateAccountDetails = asyncHandler ( async (req, res) => {
  
    const { email, fullName } = rq.body
    if(!username || !email) {
      throw new ApiError(400, "All fields are required")
    }
    
    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : { email, fullName : fullName}
    },
    { new: true})
    .select("-password")

    return res.
    status(200).json( new ApiResponse(200, user, "Account details updates successfully"))

})

// update user avatar 
const updateUserAvatar = asyncHandler( async (req, res) => {
   
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url) {
      throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate( 
      req.user?._id, 
      {
        $set : { avatar : avatar.url},
      },
      {new : true})
      .select("-password")

      return res.
      status(200).
      json( new ApiResponse(200, user, "Avatar image is updated successfully"))
})


// update cover image
const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")

  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Cover image updated successfully")
  )
})


// aggregation pipelines
const getUserChannelProfile = asyncHandler(async(req, res) => {
   
  const { username } = req.params

  if(!username?.trim()) {
     throw new ApiError(400, 'username is missing')
  }

  const channel = await User.aggregate([
    {
        $match:{
          username : username?.toLowerCase()
        }
    },
    {
        $lookup:{
          from : "subscriptions",
          localField : "_id",
          foreignField : "channel",
          as : "subscribers"
        }
    },
    {   
        $lookup:{
          from : "subscriptions",
          localField : "_id",
          foreignField : "subscriber",
          as : "subscribedTo"
        }
    },
    {
        $addFields : {
           subscribersCount : {
             $size : "$subscribers"
           },
           channelsSubscribedToCount : {
             $size : "$subscribedTo"
           },
           isSubscribed : {
             $cond : {
               if : { $in : [req.user?._id, "$subscribers.subscribe"]},
               then : true,
               else : false
             }
           }
        }
    },
    {
        $project : {
          fullName : 1,
          username : 1,
          subscribersCount : 1,
          channelsSubscribedToCount : 1,
          isSubscribed : 1,
          avatar : 1,
          coverImage : 1,
          email : 1
        }
    }
  ])

  if(!channel?.length) {
    throw new ApiError(404, "Channel does not exist")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, channel[0], "User channel fetch successfully")
  )

})

// get watch history - used the pipelines
const getWatchHistory = asyncHandler ( async(req,res) => {
    
  const user = await User.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline: [
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first: "$owner"
                        }
                    }
                }
            ]
        }
    }
  ])

  return res
  .status(200)
  .json(
      new ApiResponse(
          200,
          user[0].watchHistory,
          "Watch history fetched successfully"
      )
  )

})

export { 
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  updateAccountDetails,
  getCurrentUser,
  changeCurrentPassword,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
 };
