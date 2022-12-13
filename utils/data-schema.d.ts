export interface Department {
  code: string;
  name: string;
  link: string;
  numCourses: number;
}

export interface Course {
  code: string;
  title: string;
  units: string;
  description: string;
  anchor?: string;
  prereqs?: string | PrerequisitesSet;
  coreqs?: string | PrerequisitesSet;
}

export interface PrerequisitesSet {
  type: "all" | "one" | "two";
  courses: Array<string | PrerequisitesSet>;
}
