import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { useMemo, useState } from "react";

import { patterns } from "@/components/formula/patterns";
import { generatePattern } from "@/components/formula/formula";
import type { PatternData } from "@/components/formula/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

const isNonNullable = <T,>(value: T): value is NonNullable<T> => value != null;

const difficultyBadgeClass = (difficulty: PatternData["difficulty"]) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "Intermediate":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    case "Advanced":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
    case "Expert":
      return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
    default:
      return "";
  }
};

export function List() {
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [patternType, setPatternType] = useState<string>("");
  const [difficulty, setDifficulty] = useState<PatternData["difficulty"] | "">(
    ""
  );
  const [group, setGroup] = useState<PatternData["group"] | "">("");

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(patterns.map((p) => p.category).filter(isNonNullable))
    ).sort();
  }, []);

  const subCategoryOptions = useMemo(() => {
    const source = category
      ? patterns.filter((p) => p.category === category)
      : patterns;
    return Array.from(
      new Set(source.map((p) => p.subCategory).filter(isNonNullable))
    ).sort();
  }, [category]);

  const patternTypeOptions = useMemo(() => {
    return Array.from(
      new Set(patterns.map((p) => p.patternType).filter(isNonNullable))
    ).sort();
  }, []);

  const difficultyOptions = useMemo(() => {
    return Array.from(new Set(patterns.map((p) => p.difficulty))).sort();
  }, []);

  const groupOptions = useMemo(() => {
    return Array.from(new Set(patterns.map((p) => p.group))).sort();
  }, []);

  const filteredPatterns = useMemo(() => {
    return patterns.filter((p) => {
      if (category && p.category !== category) return false;
      if (subCategory && p.subCategory !== subCategory) return false;
      if (patternType && p.patternType !== patternType) return false;
      if (difficulty && p.difficulty !== difficulty) return false;
      if (group && p.group !== group) return false;
      return true;
    });
  }, [category, difficulty, group, patternType, subCategory]);

  const clearFilters = () => {
    setCategory("");
    setSubCategory("");
    setPatternType("");
    setDifficulty("");
    setGroup("");
  };

  return (
    <div className="flex h-[calc(100vh-7.3rem)] w-full flex-col overflow-hidden rounded-md border border-border bg-muted/30 p-2">
      <div className="mb-2 flex flex-wrap items-end gap-2 rounded-md border border-border bg-muted/30 p-2">
        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-medium text-foreground/70">
            Category
          </label>
          <select
            className="h-8 min-w-[170px] rounded-md border border-border bg-background px-2 text-xs"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory("");
            }}
          >
            <option value="">All</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-medium text-foreground/70">
            Sub Category
          </label>
          <select
            className="h-8 min-w-[170px] rounded-md border border-border bg-background px-2 text-xs"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          >
            <option value="">All</option>
            {subCategoryOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-medium text-foreground/70">
            Pattern Type
          </label>
          <select
            className="h-8 min-w-[150px] rounded-md border border-border bg-background px-2 text-xs"
            value={patternType}
            onChange={(e) => setPatternType(e.target.value)}
          >
            <option value="">All</option>
            {patternTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-medium text-foreground/70">
            Difficulty
          </label>
          <select
            className="h-8 min-w-[140px] rounded-md border border-border bg-background px-2 text-xs"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as PatternData["difficulty"] | "")
            }
          >
            <option value="">All</option>
            {difficultyOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-medium text-foreground/70">
            Group
          </label>
          <select
            className="h-8 min-w-[120px] rounded-md border border-border bg-background px-2 text-xs"
            value={group}
            onChange={(e) =>
              setGroup(e.target.value as PatternData["group"] | "")
            }
          >
            <option value="">All</option>
            {groupOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="h-8 rounded-md border border-border bg-background px-3 text-xs"
          onClick={clearFilters}
        >
          Clear
        </button>

        <div className="ml-auto text-xs text-foreground/70">
          {filteredPatterns.length}/{patterns.length}
        </div>
      </div>
      <ScrollArea className="h-full overflow-auto border pr-2">
        <div className="grid grid-cols-6 p-2 gap-2">
          {filteredPatterns.map((pattern) => (
            <ListItem key={pattern.id} pattern={pattern} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ListItem({ pattern }: { pattern: PatternData }) {
  const preview = generatePattern(pattern).join("\n");

  return (
    <Card  className="w-full h-full gap-1 p-1">
      <CardHeader className="space-y-1 p-1">
        <CardTitle className="line-clamp-2 text-xs leading-tight">
          {pattern.name}
        </CardTitle>
        <CardDescription className="text-[0.6rem] leading-snug">
          {pattern.description ? (
            <div className="line-clamp-1 text-foreground/80">
              {pattern.description}
            </div>
          ) : null}
        </CardDescription>
        <CardAction>
          <Badge
            variant="outline"
            className={difficultyBadgeClass(pattern.difficulty)}
          >
            {pattern.difficulty}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="p-1">
        <pre className="w-full overflow-auto aspect-square h-auto  rounded-md bg-background border p-2 font-mono text-xs leading-4 text-foreground">
          <code className="whitespace-pre tabular-nums flex justify-center items-center h-full w-full">
            {preview}
          </code>
        </pre>
      </CardContent>

      <CardFooter className="p-1 pr-6">
        <div className="flex flex-wrap justify-start gap-1">
          <Badge variant="outline">{pattern.group}</Badge>
          {pattern.category ? (
            <Badge variant="outline">{pattern.category}</Badge>
          ) : null}
          {pattern.subCategory ? (
            <Badge variant="outline">{pattern.subCategory}</Badge>
          ) : null}
          {pattern.patternType ? (
            <Badge variant="outline">{pattern.patternType}</Badge>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
