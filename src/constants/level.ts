export const Level = [
  {
    level: 1,
    nextRequiredExperience: 10,
  },
  {
    level: 2,
    nextRequiredExperience: 100,
  },
  {
    level: 3,
    nextRequiredExperience: 400,
  },
  {
    level: 4,
    nextRequiredExperience: 800,
  },
  {
    level: 5,
    nextRequiredExperience: 1600,
  },
  {
    level: 6,
    nextRequiredExperience: 3200,
  },
  {
    level: 7,
    nextRequiredExperience: 6400,
  },
  {
    level: 8,
    nextRequiredExperience: 12800,
  },
  {
    level: 9,
    nextRequiredExperience: 16000,
  },
]

export function getNextRequiredExperience(level: number) {
  return Level.find((item) => item.level === level)
}

export function getCurrentLevelByRangeExperience(experience: number) {
  return Level.find((item) => item.nextRequiredExperience >= experience)
}
