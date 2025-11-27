const { getAllSellers } = require("../models/sellers");
const { User } = require("../models/users");

/**
 * Get all sellers with user details
 * GET /sellers
 */
const listSellers = async (_req, res) => {
  try {
    console.log("[sellers] Fetching all sellers...");
    const sellers = await getAllSellers();
    console.log(`[sellers] Found ${sellers.length} sellers in database`);
    
    // Populate user details for each seller
    const sellersWithUserDetails = await Promise.all(
      sellers.map(async (seller) => {
        const user = await User.findById(seller.userId);
        return {
          _id: seller._id,
          userId: seller.userId,
          name: seller.name || user?.name,
          mobile: user?.mobile,
          email: user?.email,
          quantity: seller.quantity,
          rate: seller.rate,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt,
        };
      })
    );
    
    console.log(`[sellers] Returning ${sellersWithUserDetails.length} sellers with user details`);
    return res.json(sellersWithUserDetails);
  } catch (error) {
    console.error("[sellers] Failed to fetch sellers:", error);
    console.error("[sellers] Error stack:", error.stack);
    return res.status(500).json({ error: "Failed to fetch sellers", message: error.message });
  }
};

module.exports = {
  listSellers,
};
