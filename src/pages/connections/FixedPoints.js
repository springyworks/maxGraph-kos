/**
 * Copyright (c) 2006-2013, JGraph Ltd
 * Converted to ES9 syntax/React by David Morrissey 2021
 */

import React from 'react';
import mxGraph from '../../mxgraph/view/graph/mxGraph';
import mxRubberband from '../../mxgraph/handler/mxRubberband';
import mxUtils from '../../mxgraph/util/mxUtils';
import mxConstraintHandler from '../../mxgraph/handler/mxConstraintHandler';
import mxConnectionHandler from '../../mxgraph/handler/mxConnectionHandler';
import mxEdgeHandler from '../../mxgraph/handler/mxEdgeHandler';
import mxConnectionConstraint from '../../mxgraph/view/connection/mxConnectionConstraint';
import mxPoint from '../../mxgraph/util/datatypes/mxPoint';
import mxCellState from '../../mxgraph/view/cell/mxCellState';

class FixedPoints extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // A container for the graph
    return (
      <>
        <h1>Fixed points</h1>
        This example demonstrates using fixed connection points for connecting
        edges to vertices.
        <div
          ref={el => {
            this.el = el;
          }}
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '241px',
            background: "url('editors/images/grid.gif')",
            cursor: 'default',
          }}
        />
      </>
    );
  }

  componentDidMount() {
    class MyCustomConstraintHandler extends mxConstraintHandler {
      // Snaps to fixed points
      intersects(icon, point, source, existingEdge) {
        return (
          !source || existingEdge || mxUtils.intersects(icon.bounds, point)
        );
      }
    }

    class MyCustomConnectionHandler extends mxConnectionHandler {
      // connectImage = new mxImage('images/connector.gif', 16, 16);

      isConnectableCell(cell) {
        return false;
      }

      /*
       * Special case: Snaps source of new connections to fixed points
       * Without a connect preview in connectionHandler.createEdgeState mouseMove
       * and getSourcePerimeterPoint should be overriden by setting sourceConstraint
       * sourceConstraint to null in mouseMove and updating it and returning the
       * nearest point (cp) in getSourcePerimeterPoint (see below)
       */
      updateEdgeState(pt, constraint) {
        if (pt != null && this.previous != null) {
          const constraints = this.graph.getAllConnectionConstraints(
            this.previous
          );
          let nearestConstraint = null;
          let dist = null;

          for (let i = 0; i < constraints.length; i++) {
            const cp = this.graph.getConnectionPoint(
              this.previous,
              constraints[i]
            );

            if (cp != null) {
              const tmp =
                (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);

              if (dist == null || tmp < dist) {
                nearestConstraint = constraints[i];
                dist = tmp;
              }
            }
          }

          if (nearestConstraint != null) {
            this.sourceConstraint = nearestConstraint;
          }

          // In case the edge style must be changed during the preview:
          // this.edgeState.style['edgeStyle'] = 'orthogonalEdgeStyle';
          // And to use the new edge style in the new edge inserted into the graph,
          // update the cell style as follows:
          // this.edgeState.cell.style = mxUtils.setStyle(this.edgeState.cell.style, 'edgeStyle', this.edgeState.style['edgeStyle']);
        }
        return super.updateEdgeState(pt, constraint);
      }

      createEdgeState(me) {
        // Connect preview
        const edge = this.graph.createEdge(
          null,
          null,
          null,
          null,
          null,
          'edgeStyle=orthogonalEdgeStyle'
        );

        return new mxCellState(
          this.graph.view,
          edge,
          this.graph.getCellStyle(edge)
        );
      }
    }

    class MyCustomEdgeHandler extends mxEdgeHandler {
      // Disables floating connections (only use with no connect image)
      isConnectableCell(cell) {
        return graph.connectionHandler.isConnectableCell(cell);
      }
    }

    class MyCustomGraph extends mxGraph {
      createConnectionHandler() {
        const r = new MyCustomConnectionHandler();
        r.constraintHandler = new MyCustomConstraintHandler(this);
        return r;
      }

      createEdgeHandler(state, edgeStyle) {
        const r = new MyCustomEdgeHandler(state, edgeStyle);
        r.constraintHandler = new MyCustomConstraintHandler(this);
        return r;
      }

      getAllConnectionConstraints(terminal) {
        if (terminal != null && terminal.cell.isVertex()) {
          return [
            new mxConnectionConstraint(new mxPoint(0, 0), true),
            new mxConnectionConstraint(new mxPoint(0.5, 0), true),
            new mxConnectionConstraint(new mxPoint(1, 0), true),
            new mxConnectionConstraint(new mxPoint(0, 0.5), true),
            new mxConnectionConstraint(new mxPoint(1, 0.5), true),
            new mxConnectionConstraint(new mxPoint(0, 1), true),
            new mxConnectionConstraint(new mxPoint(0.5, 1), true),
            new mxConnectionConstraint(new mxPoint(1, 1), true),
          ];
        }
        return null;
      }
    }

    // Creates the graph inside the given container
    const graph = new MyCustomGraph(this.el);
    graph.setConnectable(true);

    // Enables rubberband selection
    new mxRubberband(graph);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const v1 = graph.insertVertex({
        parent,
        value: 'Hello,',
        position: [20, 20],
        size: [80, 60],
        style: 'shape=triangle;perimeter=trianglePerimeter',
      });
      const v2 = graph.insertVertex({
        parent,
        value: 'World!',
        position: [200, 150],
        size: [80, 60],
        style: 'shape=ellipse;perimeter=ellipsePerimeter',
      });
      const v3 = graph.insertVertex({
        parent,
        value: 'Hello,',
        position: [200, 20],
        size: [80, 30],
      });
      const e1 = graph.insertEdge({
        parent,
        value: '',
        source: v1,
        target: v2,
        style:
          'edgeStyle=elbowEdgeStyle;elbow=horizontal;' +
          'exitX=0.5;exitY=1;exitPerimeter=1;entryX=0;entryY=0;entryPerimeter=1;',
      });
      const e2 = graph.insertEdge({
        parent,
        value: '',
        source: v3,
        target: v2,
        style:
          'edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=0;' +
          'entryX=0;entryY=0;entryPerimeter=1;',
      });
    });

    // Use this code to snap the source point for new connections without a connect preview,
    // ie. without an overridden graph.connectionHandler.createEdgeState
    /*
      let mxConnectionHandlerMouseMove = mxConnectionHandler.prototype.mouseMove;
      mxConnectionHandler.prototype.mouseMove = function(sender, me)
      {
          this.sourceConstraint = null;

          mxConnectionHandlerMouseMove.apply(this, arguments);
      };

      let mxConnectionHandlerGetSourcePerimeterPoint = mxConnectionHandler.prototype.getSourcePerimeterPoint;
      mxConnectionHandler.prototype.getSourcePerimeterPoint = function(state, pt, me)
      {
          let result = null;

          if (this.previous != null && pt != null)
          {
              let constraints = this.graph.getAllConnectionConstraints(this.previous);
              let nearestConstraint = null;
              let nearest = null;
              let dist = null;

              for (let i = 0; i < constraints.length; i++)
              {
                  let cp = this.graph.getConnectionPoint(this.previous, constraints[i]);

                  if (cp != null)
                  {
                      let tmp = (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);

                      if (dist == null || tmp < dist)
                      {
                          nearestConstraint = constraints[i];
                          nearest = cp;
                          dist = tmp;
                      }
                  }
              }

              if (nearestConstraint != null)
              {
                  this.sourceConstraint = nearestConstraint;
                  result = nearest;
              }
          }

          if (result == null)
          {
              result = mxConnectionHandlerGetSourcePerimeterPoint.apply(this, arguments);
          }

          return result;
      };
      */
  }
}

export default FixedPoints;
