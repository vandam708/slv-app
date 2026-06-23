import { useMemo } from 'react';
import { useStore } from './useStore';
import { DEFAULT_TASKS, DEFAULT_FOCUS, BOGDAN_IDEAS, type Task, type SportExercise, type FocusProfile, type Idea } from '../domain/config';
import { intNum, normalizeXp, num, type DataMap } from '../domain/logic';

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface Config {
  myTasks: Task[];
  mindTasks: Task[];
  choreTasks: Task[];
  bogdanTasks: Task[];
  focus: FocusProfile;
  focusIdeas: Idea[];
  sport: SportExercise[];
  fizz: Task[];
  shadow: Task[];
  soul: Task[];
  weight: number;
  totalXP: number;
}

export function deriveConfig(data: DataMap): Config {
  return {
    myTasks: parse(data['slv_config_tasks'], DEFAULT_TASKS.slv),
    mindTasks: parse(data['slv_config_mind'], [] as Task[]),
    choreTasks: parse(data['slv_config_chores'], [] as Task[]),
    bogdanTasks: parse(data['bogdan_config_tasks'], DEFAULT_TASKS.bogdan),
    focus: parse(data['slv_focus_profile'], DEFAULT_FOCUS),
    focusIdeas: parse(data['slv_focus_ideas'], BOGDAN_IDEAS),
    sport: parse(data['slv_config_sport'], DEFAULT_TASKS.sport),
    fizz: parse(data['slv_config_fizz'], DEFAULT_TASKS.fizz),
    shadow: parse(data['slv_config_shadow'], DEFAULT_TASKS.shadow),
    soul: parse(data['slv_config_soul'], DEFAULT_TASKS.soul),
    weight: intNum(data['slv_user_weight'], 70),
    totalXP: normalizeXp(num(data['slv_total_xp'], 0)),
  };
}

export function useConfig(): Config {
  const data = useStore((s) => s.data);
  return useMemo(() => deriveConfig(data), [data]);
}

export function useData(): DataMap {
  return useStore((s) => s.data);
}
