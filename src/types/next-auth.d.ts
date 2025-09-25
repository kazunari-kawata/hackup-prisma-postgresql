declare module "next-auth" {
  interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    iconUrl: string | null;
    karmaScore: number;
  }
  interface Session {
    user: User;
  }
}
