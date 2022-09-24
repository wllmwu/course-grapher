export interface Department {
  code: string;
  name: string;
  link: string;
}

export interface Course {
  code: string;
  title: string;
  units: string;
  anchor?: string;
  prereqs?: PrerequisitesTree;
  coreqs?: PrerequisitesTree;
}

export interface PrerequisitesTree {
  type: "all" | "one" | "two";
  courses: Array<string | PrerequisitesTree>;
}
