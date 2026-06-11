import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./page";

const push = vi.fn();
const signInWithPopup = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("firebase/auth", () => ({
  signInWithPopup: (...args: unknown[]) => signInWithPopup(...args),
}));

vi.mock("../firebase", () => ({
  auth: {},
  googleProvider: {},
}));

describe("Login page", () => {
  beforeEach(() => {
    push.mockReset();
    signInWithPopup.mockReset();
  });

  it("renders app branding and Google sign-in", () => {
    render(<Login />);

    expect(screen.getByText("Blossom Budget")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /đăng nhập bằng google/i }),
    ).toBeInTheDocument();
  });

  it("redirects to dashboard after successful login", async () => {
    const user = userEvent.setup();
    signInWithPopup.mockResolvedValueOnce({ user: { uid: "test-user" } });

    render(<Login />);
    await user.click(
      screen.getByRole("button", { name: /đăng nhập bằng google/i }),
    );

    expect(signInWithPopup).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
