
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  // Expenses
  expenses: defineTable({
    description: v.string(),
    amount: v.number(),
    category: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    splitType: v.string(), // "equal", "percentage", "exact"
    splits: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        amount: v.number(), // amount owed by this user
        paid: v.boolean(),
      })
    ),
    groupId: v.optional(v.id("groups")), // null for one-on-one expenses
    createdBy: v.id("users"), // Reference to users table
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_date", ["date"]),

  // Settlements
  settlements: defineTable({
    amount: v.number(),
    note: v.optional(v.string()),
    date: v.number(), // timestamp
    paidByUserId: v.id("users"), // Reference to users table
    receivedByUserId: v.id("users"), // Reference to users table
    groupId: v.optional(v.id("groups")), // null for one-on-one settlements
    relatedExpenseIds: v.optional(v.array(v.id("expenses"))), // Which expenses this settlement covers
    createdBy: v.id("users"), // Reference to users table
  })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_receiver_and_group", ["receivedByUserId", "groupId"])
    .index("by_date", ["date"]),

  // Groups
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"), // Reference to users table
    members: v.array(
      v.object({
        userId: v.id("users"), // Reference to users table
        role: v.string(), // "admin" or "member"
        joinedAt: v.number(),
      })
    ),
  }),
});




// Users



// “The users table stores core user info like name, email, and tokenIdentifier (from auth). It also supports an optional profile image.
// I added:



// Indexes on tokenIdentifier and email for fast lookups,

// Search indexes on name and email for full-text search, so we can implement features like searching contacts by name or email.”

    
//  Expenses

// “The expenses table models each expense: description, amount, category, timestamp, who paid, and how it’s split among users.
// I allow different splitTypes like equal, percentage, or exact.
// Each expense has an array of splits, where each user’s owed amount and payment status is tracked.
// Expenses can belong to a groupId or just be one-on-one.

// I created indexes for:

// by_group → quickly list expenses inside a group,

// by_user_and_group → filter by user activity in a group,

// by_date → sort or filter by time for reports/history.”

// Settlements

// “The settlements table tracks money transfers between users to settle debts. It stores amount, optional note, payer, receiver, and related expense IDs.
// Indexes here help with:

// Finding settlements by group,

// By payer and group,

// By receiver and group,

// And sorting by date.

// This makes it easy to generate a settlement history per user or per group.”

// 👥 Groups

// “The groups table allows multiple users to share expenses. Each group has a name, optional description, creator, and a members array that stores user IDs, roles (admin/member), and when they joined.
// This structure supports both group and one-on-one expense sharing.”

// 🔑 Wrap-up

// “Overall, the schema is normalized, each entity references users via foreign keys, and I’ve designed indexes for the most common queries — like looking up expenses by group, finding user settlements, or searching users by email. This makes the system efficient and scalable for real-world usage.”