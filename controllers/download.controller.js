import Download from "../models/download.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadtoS3 } from "../utils/awsService.js";

export const download_controller = async (req, res) => {
  console.log(req.user);
  const { userId } = req.user;
  const expenses = req.expenses;
  const stringifiedExpenses = JSON.stringify(expenses);
  const filename = `${userId}-${new Date()}-${userId}.txt`;

  try {
    const fileURL = await uploadtoS3(stringifiedExpenses, filename);
    if (!fileURL) {
      return res
        .status(400)
        .json(new ApiError(400, "Please try after sometime", {}).toJSON());
    }
    const updateDownload = await Download.create(
      {
        fileName: fileURL.Key,
        downloadURL: fileURL.Location,
        userId,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    if (!updateDownload) {
      return res
        .status(400)
        .json(new ApiError(400, "Please try after sometime", {}).toJSON());
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "File is successfully uploaded",
          { downloadURL: fileURL.Location },
          null
        ).toJSON()
      );
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, "Something went wrong", { error }).toJSON());
  }
};

export const download_list_controller = async (req, res) => {
  const { userId } = req.user;
  console.log("reached controller", userId);
  try {
    const listOfDownload = await Download.findAll({
      where: {
        userId,
      },
    });
    console.log(listOfDownload);
    if (!listOfDownload) {
      return res
        .status(500)
        .json(new ApiError(500, "Internal Server Error", {}));
    }
    return res.status(200).json(
      new ApiResponse(200, `Fetched download history`, {
        listOfDownload,
      })
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal Server Error", { error }));
  }
};
