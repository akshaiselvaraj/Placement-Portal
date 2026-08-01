import { AuthService } from '../src/modules/auth/auth.service';

async function main() {
  try {
    const result = await AuthService.login({
      email: 'ajai@gmail.com',
      password: 'password123'
    });
    console.log("Login successful! User:", result.user);
    console.log("Token:", result.token);
  } catch (error) {
    console.error("Login failed:", error);
  }
}

main();
