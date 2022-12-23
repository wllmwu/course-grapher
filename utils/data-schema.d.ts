export interface Department {
  code: string;
  name: string;
  link: string;
  courses: string[];
}

export interface Course {
  code: string;
  title: string;
  units: string;
  description: string;
  dept: string;
  anchor?: string;
  prereqs?: string | PrerequisitesSet;
  coreqs?: string | PrerequisitesSet;
  successors?: string[];
}

export interface PrerequisitesSet {
  type: "all" | "one" | "two";
  courses: Array<string | PrerequisitesSet>;
}
