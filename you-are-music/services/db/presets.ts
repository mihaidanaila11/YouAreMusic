"use server"

import { Preset, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/prisma";

export async function fetchPresetsAction() {
  const presets = await prisma.preset.findMany({
    where: {
      public: true,
    }
  });
  return presets;
}

export async function savePresetAction(newPreset: Omit<Preset, "id">) {
    const createdPreset = await prisma.preset.create({
    data: {
      ...newPreset,
      data: newPreset.data === null ? Prisma.JsonNull : newPreset.data,
    }
    })
    return createdPreset;
}