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
};

export async function fetchPresetsByUserIdAction(userId: string) {
    const presets = await prisma.preset.findMany({
        where: {
            userId: userId,
        }
    });
    return presets;
};

export async function deletePresetAction(presetId: string) {
    try{
      await prisma.preset.delete({
        where: {
            id: presetId,
        }
    });

      return { success: true };
    }
    catch(error){
        console.error("Error deleting preset:", error);
        return {error: "Failed to delete preset"};
    }
}