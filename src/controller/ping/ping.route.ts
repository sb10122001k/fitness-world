import { asyncRoute } from "../../server/async-route";
import { Route } from "../../server/route";

export const PingRoute:Route={
    method:"get",
    route:"/ping",
   
    docs:{
        description:"A simple ping endpoint to check if the server is running",
    },
    handler:[
        asyncRoute(async (req, res) => {
            console.log("Received ping request");
            res.status(200).json({ message: "pong" });
        }),
    ]
}