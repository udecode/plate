import React from 'react';
import { isText, PlateEditor } from "../types";
  /*
  The strategy is to take each node, read its type, find the corresponding component to render 
  this type, and then render it.
  
  Because this is for read only content, we need not worry about changes.
  */

  const renderNode = (node:any, index:number, editor:PlateEditor<any>) => {
    let type = node.type;
    // get the component corresponding to the node's type
    let component = editor.pluginsByKey[type].component;
    if (isText(node)) {
      // process soft breaks
      let encodedText = encodeURI(node.text);
      let softBreaked = encodedText.split('%0A');
      return (
        <span key={index}>
          {softBreaked.map((txt, index) => {
            return (
              <span key={index}>
                {decodeURI(txt)}
                {index === softBreaked.length - 1 ? null : <br />}
              </span>
            );
          })}
        </span>
      );
    }
    let children = node.children.map((node,index)=>renderNode(node,index,editor));
    return React.createElement(
      component,
      { element: { ...node }, attributes: {}, prefix: '', children, key: index },
      // recursively render the children
      children
    );
  };
  
  export const ReadOnlyDisplay =  (props: { nodes: any[], editor:PlateEditor<any> }) => {
    let components = props.nodes.map((node,index)=>renderNode(node,index,props.editor));
    return <>{components}</>;
  };
