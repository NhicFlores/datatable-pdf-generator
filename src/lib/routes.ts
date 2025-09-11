export const FuelReportRoute = {
  label: "Fuel Report",
  page: "/fuel-report",
  detailPage: (id: string) => `/fuel-report/${id}`,
};

export const FuelReportSummaryRoute = {
  label: "Fuel Report Summary",
  page: "/fuel-report/summary",
};

export const AdminRoute = {
  label: "Admin",
  page: "/admin",
};

export const HomeRoute = {
  label: "Home",
  page: "/",
};

export const AuthRoute = {
  signIn: "/auth/signin",
//   error: "/auth/error",
  // signUp: "/auth/signup",
  // forgotPassword: "/auth/forgot-password",
};
