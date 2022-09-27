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
  prereqs?: PrerequisitesTree;
  coreqs?: PrerequisitesTree;
}

export interface PrerequisitesTree {
  type: "all" | "one" | "two";
  courses: Array<string | PrerequisitesTree>;
}
