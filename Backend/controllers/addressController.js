
import Address from "../models/Address.js";

export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createAddress = async (req, res) => {
  try {
    const {
      label,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    const saved = await Address.create({
      user: req.user._id,
      label: label || "Home",
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    });

    res.status(201).json({
      success: true,
      address: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address =
      await Address.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Address deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
