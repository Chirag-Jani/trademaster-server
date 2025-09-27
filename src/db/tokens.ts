import TokenModel from "./TokenModel";

export const getTokenStats = async () => {
  try {
    const totalTokens = await TokenModel.countDocuments();
    const lastUpdated = await TokenModel.findOne()
      .sort({ updatedAt: -1 })
      .select("updatedAt token_symbol");
    const newestTokens = await TokenModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("token_symbol token_id createdAt");

    return {
      success: true,
      data: {
        totalTokens,
        lastUpdated,
        newestTokens,
      },
    };
  } catch (error) {
    console.error("Error getting token stats:", error);
    return {
      success: false,
      error: "Failed to get token stats",
    };
  }
};
