import { InspectHandlers } from ".";

export const register: InspectHandlers = ({ router, governance }) => {
    router.add("governance/listDaoMembers", () => {
        return JSON.stringify(governance.isMember);
    })
};