
export default async function handler(req: any, res: any) {
  const { method } = req;
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ status: "error", message: "Unauthorized" });

  if (method === 'GET') {
    return res.status(200).json({
      status: "success",
      ingredients: ["tomato", "onion", "garlic", "chicken", "spinach", "paneer", "rice", "dal"]
    });
  }

  if (method === 'POST') {
    return res.status(201).json({
      status: "success",
      message: "Ingredient added successfully"
    });
  }

  return res.status(405).json({ status: "error", message: "Method not allowed" });
}
