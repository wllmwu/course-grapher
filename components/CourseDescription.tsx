import React from "react";

interface CourseDescriptionProps {
  text: string;
}

function CourseDescription({ text }: CourseDescriptionProps) {
  // regex capturing groups are included in the array returned from `split()`
  const splitText = text.split(/((?:Pre|Co)requisites:)/g);
  return (
    <p>
      {splitText.map((substring, index) => (
        <React.Fragment key={index}>
          {index % 2 === 0 ? substring : <strong>{substring}</strong>}
        </React.Fragment>
      ))}
    </p>
  );
}

export default CourseDescription;
