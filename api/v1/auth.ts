export default async function handler(req: any, res: any) {
  const { method } = req;

  try {
    if (method === 'POST') {
      const { email, username, action } = req.body;
      const safeEmail: string = typeof email === 'string' ? email : 'user@example.com';

      if (action === 'register') {
        const newUser = { 
          uid: Math.random().toString(36).substring(2, 11), 
          username: username || safeEmail.split('@')[0], 
          email: safeEmail,
          preferences: {
            diet: 'None',
            skillLevel: 'Intermediate',
            favoriteCuisines: [],
            allergies: [],
            defaultServings: 2
          }
        };
        return res.status(201).json({
          status: "success",
          message: "Account created successfully",
          user: newUser,
          token: btoa(JSON.stringify(newUser))
        });
      }

      if (action === 'login') {
        const user = { 
          uid: "user_" + btoa(safeEmail).substring(0, 8), 
          username: safeEmail.split('@')[0], 
          email: safeEmail,
          preferences: {
            diet: 'None',
            skillLevel: 'Intermediate',
            favoriteCuisines: [],
            allergies: [],
            defaultServings: 2
          }
        };
        return res.status(200).json({
          status: "success",
          message: "Login successful",
          token: btoa(JSON.stringify(user)),
          user
        });
      }
    }

    if (method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ status: "error", message: "Unauthorized" });

      try {
        const token = authHeader.split(' ')[1];
        if (!token) throw new Error("No token provided");
        const user = JSON.parse(atob(token));
        return res.status(200).json({ status: "success", user });
      } catch (e) {
        return res.status(401).json({ status: "error", message: "Invalid Token" });
      }
    }

    return res.status(405).json({ status: "error", message: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
}