import React from "react";

interface GraphContextValue {
  hasPointer: boolean;
}

const GraphContext = React.createContext<GraphContextValue>({
  hasPointer: true,
});

export default GraphContext;
