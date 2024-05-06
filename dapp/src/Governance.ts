import { Hex } from "viem";

// Manages votes, decisions, validations of actions
// used in the creation of new bet models
// Can we leverage the DSG for DAOs?
/**
 * The `Governance` class is responsible for managing votes, decisions, and validations of actions used in the creation of new bet models.
 * It provides functionality for adding and removing members from a list of addresses.
 */
export default class Governance {
  private static instance: Governance;
  private members: Set<string>;

  /**
   * Private constructor to enforce singleton pattern.
   * @param members An array of initial members.
   */
  private constructor(members: string[]) {
    this.members = new Set(members);
  }

  /**
   * Returns the singleton instance of the `Governance` class.
   * @returns The singleton instance of the `Governance` class.
   */
  public static getInstance(): Governance {
    if (!Governance.instance) {
      Governance.instance = new Governance([
        "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      ]);
    }
    return Governance.instance;
  }

  /**
   * Checks if the given address is a member of the governance.
   * @param address The address to check.
   * @returns True if the address is a member, false otherwise.
   */
  public isMember(address: string): boolean {
    return this.members.has(address.toLowerCase());
  }

  /**
   * Adds a new member to the governance if the `msgSender` is already a member.
   * @param address The address of the new member.
   * @param msgSender The address of the message sender.
   * @throws Error if the `msgSender` is not a member or if the `address` is already a member.
   */
  public addMember(address: string, msgSender: string): void {
    if (!this.isMember(msgSender.toLowerCase())) {
      throw new Error("Only members can add new members");
    }

    if (this.isMember(address.toLowerCase())) {
      throw new Error("This address is already a member");
    }

    this.members.add(address.toLowerCase());
  }

  /**
   * Removes a member from the governance if the `msgSender` is already a member.
   * @param address The address of the member to remove.
   * @param msgSender The address of the message sender.
   * @throws Error if the `msgSender` is not a member or if the `address` is not a member.
   */
  public removeMember(address: string, msgSender: string): void {
    if (!this.isMember(msgSender.toLowerCase())) {
      throw new Error("Only members can remove members");
    }

    if (!this.isMember(address.toLowerCase())) {
      throw new Error("This address is not a member");
    }

    this.members.delete(address.toLowerCase());
  }
}