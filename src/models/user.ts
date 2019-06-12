// User model based on the structure of github api at
// https://api.github.com/users/{username}

export interface User {
    tmpId: number;
    username: string;
    password: string;
    usergroup: string;
  }