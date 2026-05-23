/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import('lucia').User | null;
    session: import('lucia').Session | null;
  }
}
