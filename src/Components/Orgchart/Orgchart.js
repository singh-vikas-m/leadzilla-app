import React from "react";
import Tree from "react-d3-tree";
import { useCenteredTree } from "./helpers";
import "./Orgchart.css";

const containerStyles = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItem: "center",
};

const orgChartData = {
  name: "CEO",
  children: [
    {
      name: "Manager",
      attributes: {
        department: "Production",
      },
      children: [
        {
          name: "Foreman",
          attributes: {
            department: "Fabrication",
          },
          children: [
            {
              name: "Workers",
            },
          ],
        },
        {
          name: "Foreman",
          attributes: {
            department: "Assembly",
          },
          children: [
            {
              name: "Workers",
            },
          ],
        },
      ],
    },
    {
      name: "Manager",
      attributes: {
        department: "Marketing",
      },
      children: [
        {
          name: "Sales Officer",
          attributes: {
            department: "A",
          },
          children: [
            {
              name: "Salespeople",
            },
          ],
        },
        {
          name: "Sales Officer",
          attributes: {
            department: "B",
          },
          children: [
            {
              name: "Salespeople",
            },
          ],
        },
      ],
    },
  ],
};

// Here we're using `renderCustomNodeElement` to represent each node
// as an SVG `rect` instead of the default `circle`.
// const renderRectSvgNode = ({ nodeDatum, toggleNode }) => (
//   <g>
//     <rect width="20" height="20" x="-10" onClick={toggleNode} />
//     <text fill="black" strokeWidth="1" x="20">
//       {nodeDatum.name}
//     </text>
//     {nodeDatum.attributes?.department && (
//       <text fill="black" x="20" dy="20" strokeWidth="1">
//         Department: {nodeDatum.attributes?.department}
//       </text>
//     )}
//   </g>
// );

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
}) => (
  <g>
    <circle r={15}></circle>
    {/* `foreignObject` requires width & height to be explicitly set. */}
    <foreignObject {...foreignObjectProps}>
      <div style={{ border: "1px solid black", backgroundColor: "#dedede" }}>
        <img src="https://www.google.com/favicon.ico" alt="sa" />
        <h3 style={{ textAlign: "center" }}>{nodeDatum.name}</h3>
        {nodeDatum.attributes?.department && (
          <p
            style={{ textAlign: "center" }}
            fill="black"
            x="20"
            dy="20"
            strokeWidth="1"
          >
            Department: {nodeDatum.attributes?.department}
          </p>
        )}
        {nodeDatum.children && (
          <button style={{ width: "100%" }} onClick={toggleNode}>
            {nodeDatum.__rd3t.collapsed ? "Expand" : "Collapse"}
          </button>
        )}
      </div>
    </foreignObject>
  </g>
);

export default function Orgchart() {
  // const [dimensions, translate, containerRef] = useCenteredTree();
  // return (
  //   <div style={containerStyles} ref={containerRef} className="Orgchart">
  //     <Tree
  //       data={orgChartData}
  //       dimensions={dimensions}
  //       translate={translate}
  //       renderCustomNodeElement={renderRectSvgNode}
  //       orientation="vertical"
  //       // pathFunc={"step"}
  //     />
  //   </div>
  // );

  const [translate, containerRef] = useCenteredTree();
  const nodeSize = { x: 200, y: 200 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };
  return (
    <div className="Orgchart" style={containerStyles} ref={containerRef}>
      <Tree
        data={orgChartData}
        translate={translate}
        nodeSize={nodeSize}
        renderCustomNodeElement={(rd3tProps) =>
          renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
        }
        orientation="vertical"
      />
    </div>
  );
}
