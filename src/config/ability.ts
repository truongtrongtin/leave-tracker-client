import { Ability, AbilityBuilder } from "@casl/ability";
import { User } from "pages/Employee/Employee";

type Actions = "create" | "read" | "update" | "delete";
type Subjects = "User" | "Leave";
type AppAbility = Ability<[Actions, Subjects]>;

const ability = new Ability<[Actions, Subjects]>();

export function defineRulesFor(user: User) {
  const { can, rules } = new AbilityBuilder<AppAbility>(Ability);

  switch (user.role) {
    case "ADMIN":
      can("update", "Leave");
      break;
    case "MEMBER":
      can("read", "Leave");
      break;
    default:
      break;
  }
  return rules;
}

export default ability;
