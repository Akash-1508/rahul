const { getAllBuyers } = require("../models/buyers");
const { User } = require("../models/users");

/**
 * Get all buyers with user details
 * GET /buyers
 */
const listBuyers = async (_req, res) => {
  try {
    console.log("[buyers] Fetching all buyers...");
    const buyers = await getAllBuyers();
    console.log(`[buyers] Found ${buyers.length} buyers in database`);
    
    // Populate user details for each buyer
    const buyersWithUserDetails = await Promise.all(
      buyers.map(async (buyer) => {
        const user = await User.findById(buyer.userId);
        return {
          _id: buyer._id,
          userId: buyer.userId,
          name: buyer.name || user?.name,
          mobile: user?.mobile,
          email: user?.email,
          quantity: buyer.quantity,
          rate: buyer.rate,
          createdAt: buyer.createdAt,
          updatedAt: buyer.updatedAt,
        };
      })
    );
    
    console.log(`[buyers] Returning ${buyersWithUserDetails.length} buyers with user details`);
    return res.json(buyersWithUserDetails);
  } catch (error) {
    console.error("[buyers] Failed to fetch buyers:", error);
    console.error("[buyers] Error stack:", error.stack);
    return res.status(500).json({ error: "Failed to fetch buyers", message: error.message });
  }
};

module.exports = {
  listBuyers,
};

