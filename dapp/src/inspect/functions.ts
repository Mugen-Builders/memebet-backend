import { InspectHandlers } from ".";

export const register: InspectHandlers = ({ router, validatorManager }) => {
    router.add("functions/getAllFunctionNames", () => {
        return JSON.stringify(validatorManager?.getAllFunctionNames());
    })
};