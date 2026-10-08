export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IResetPasswordPayload {
  token: string;
  password: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
