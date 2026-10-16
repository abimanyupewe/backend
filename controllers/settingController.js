import settingModel from "../models/settingModel.js";

// Get Global Settings
const getSettings = async (req, res) => {
  try {
    let settings = await settingModel.findOne({});
    if (!settings) {
      settings = await settingModel.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update Global Settings
const updateSettings = async (req, res) => {
  try {
    const { platformFeePercentage, platformBankAccounts } = req.body;
    let settings = await settingModel.findOne({});
    
    if (!settings) {
      settings = new settingModel({});
    }

    if (platformFeePercentage !== undefined) settings.platformFeePercentage = platformFeePercentage;
    
    if (platformBankAccounts !== undefined && Array.isArray(platformBankAccounts)) {
      settings.platformBankAccounts = platformBankAccounts;
    }

    await settings.save();
    res.json({ success: true, message: "Settings updated successfully", data: settings });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getSettings, updateSettings };
