import { Route } from "../server/route";
import { CreateAdminRoute } from "./admin/create-admin/create-admin.route";
import { LoginAdminRoute } from "./admin/login/login-admin.route";
import { CreatePaymentLogRoute } from "./payment-log/create-payment-log/create-payment-log";
import { UpdatePaymentLogRoute } from "./payment-log/update-payment-log/create-payment-log";
import { CreateUserRoute } from "./user/create-user/create-user.route";
import { DeleteUserRoute } from "./user/delete-user/delete-user.route";
import { FetchUserByIdRoute } from "./user/fetch-user/fetch-user-by-id/fetch-user.route";
import { FetchUserRoute } from "./user/fetch-user/fetch-user.route";
import { UpdateUserRoute } from "./user/update-user/update-user.route";

export const apiRoutes: Route[] = [
    CreatePaymentLogRoute,
    UpdatePaymentLogRoute,
    FetchUserByIdRoute,
    DeleteUserRoute,
    UpdateUserRoute,
    FetchUserRoute,
    CreateAdminRoute,
    CreateUserRoute,
    LoginAdminRoute,
]