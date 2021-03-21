/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 * Updated to ES9 syntax by David Morrissey 2021
 */

import mxPoint from "FIXME";

class mxEdgeLabelLayout extends mxGraphLayout {
  /**
   * Class: mxEdgeLabelLayout
   *
   * Extends <mxGraphLayout> to implement an edge label layout. This layout
   * makes use of cell states, which means the graph must be validated in
   * a graph view (so that the label bounds are available) before this layout
   * can be executed.
   *
   * Example:
   *
   * (code)
   * let layout = new mxEdgeLabelLayout(graph);
   * layout.execute(graph.getDefaultParent());
   * (end)
   *
   * Constructor: mxEdgeLabelLayout
   *
   * Constructs a new edge label layout.
   *
   * Arguments:
   *
   * graph - <mxGraph> that contains the cells.
   */
  constructor(graph, radius) {
    super(graph);
  };

  /**
   * Function: execute
   *
   * Implements <mxGraphLayout.execute>.
   */
  execute = (parent) => {
    let view = this.graph.view;
    let model = this.graph.getModel();

    // Gets all vertices and edges inside the parent
    let edges = [];
    let vertices = [];
    let childCount = model.getChildCount(parent);

    for (let i = 0; i < childCount; i++) {
      let cell = model.getChildAt(parent, i);
      let state = view.getState(cell);

      if (state != null) {
        if (!this.isVertexIgnored(cell)) {
          vertices.push(state);
        } else if (!this.isEdgeIgnored(cell)) {
          edges.push(state);
        }
      }
    }

    this.placeLabels(vertices, edges);
  };

  /**
   * Function: placeLabels
   *
   * Places the labels of the given edges.
   */
  placeLabels = (v, e) => {
    let model = this.graph.getModel();

    // Moves the vertices to build a circle. Makes sure the
    // radius is large enough for the vertices to not
    // overlap
    model.beginUpdate();
    try {
      for (let i = 0; i < e.length; i++) {
        let edge = e[i];

        if (edge != null && edge.text != null &&
            edge.text.boundingBox != null) {
          for (let j = 0; j < v.length; j++) {
            let vertex = v[j];

            if (vertex != null) {
              this.avoid(edge, vertex);
            }
          }
        }
      }
    } finally {
      model.endUpdate();
    }
  };

  /**
   * Function: avoid
   *
   * Places the labels of the given edges.
   */
  avoid = (edge, vertex) => {
    let model = this.graph.getModel();
    let labRect = edge.text.boundingBox;

    if (mxUtils.intersects(labRect, vertex)) {
      var dy1 = -labRect.y - labRect.height + vertex.y;
      var dy2 = -labRect.y + vertex.y + vertex.height;

      let dy = (Math.abs(dy1) < Math.abs(dy2)) ? dy1 : dy2;

      var dx1 = -labRect.x - labRect.width + vertex.x;
      var dx2 = -labRect.x + vertex.x + vertex.width;

      let dx = (Math.abs(dx1) < Math.abs(dx2)) ? dx1 : dx2;

      if (Math.abs(dx) < Math.abs(dy)) {
        dy = 0;
      } else {
        dx = 0;
      }

      let g = model.getGeometry(edge.cell);

      if (g != null) {
        g = g.clone();

        if (g.offset != null) {
          g.offset.x += dx;
          g.offset.y += dy;
        } else {
          g.offset = new mxPoint(dx, dy);
        }

        model.setGeometry(edge.cell, g);
      }
    }
  };
}

export default mxEdgeLabelLayout;
