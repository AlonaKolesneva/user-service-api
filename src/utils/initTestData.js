export const createTestData = async ({ User }) => {
  try {
    await User.create({
      email: "test@user.com",
      password: "password",
      isTest: true,
    });
  } catch (error) {
    console.error("Error creating test data:", error);
    throw error;
  }
};
