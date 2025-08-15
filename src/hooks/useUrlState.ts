"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchStore } from "../store/useSearchStore";

export function useUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSearchTerm, searchTerm, setSortBy, setSortOrder } = useSearchStore();
  const isUpdatingFromUrl = useRef(false);

  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    
    router.replace(`/${query}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (isUpdatingFromUrl.current) return;
    
    const urlSearchTerm = searchParams.get("q") || "";
    const urlSortBy = searchParams.get("sort") as "relevance" | "experience" | "name" || "relevance";
    const urlSortOrder = searchParams.get("order") as "asc" | "desc" || "desc";

    setSearchTerm(urlSearchTerm);
    setSortBy(urlSortBy);
    setSortOrder(urlSortOrder);
  }, [searchParams]);

  useEffect(() => {
    if (isUpdatingFromUrl.current) return;
    
    isUpdatingFromUrl.current = true;
    updateUrl({
      q: searchTerm || null,
    });
    
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
    }, 50);
  }, [searchTerm, updateUrl]);

  return { updateUrl };
}