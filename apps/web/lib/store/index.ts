import { prismaStore } from "./prisma-store";
import type { Store } from "./types";

export const store: Store = prismaStore;

export type { Store, NewIssue, IssueFilter } from "./types";
