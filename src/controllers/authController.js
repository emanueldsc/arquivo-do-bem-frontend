import { authService } from "../services/authService";
import { tokenService } from "../services/tokenService";

export const authController = {
  async handleRegisterStudent(form) {
    const { user } = await authService.registerStudent(form);
    return user;
  },

  async handleRegisterProfessor(form) {
    const { user } = await authService.registerProfessor(form);
    return user;
  },

  async handleLogin(form) {
    const { jwt, user } = await authService.login(form);
    const meRes  = await authService.me(jwt);
    const fullUser = { ...user, ...meRes.user };

    tokenService.save({ jwt, user: fullUser });
    return fullUser;
  },

  logout() {
    tokenService.clear();
  }
};
