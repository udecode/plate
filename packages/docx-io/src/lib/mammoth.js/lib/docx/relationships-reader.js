exports.readRelationships = readRelationships;
exports.defaultValue = new Relationships([]);
exports.Relationships = Relationships;

function readRelationships(element) {
  var relationships = [];
  element.children.forEach((child) => {
    if (child.name === 'relationships:Relationship') {
      var relationship = {
        relationshipId: child.attributes.Id,
        target: child.attributes.Target,
        type: child.attributes.Type,
      };
      relationships.push(relationship);
    }
  });
  return new Relationships(relationships);
}

function Relationships(relationships) {
  var targetsByRelationshipId = {};
  relationships.forEach((relationship) => {
    targetsByRelationshipId[relationship.relationshipId] = relationship.target;
  });

  var targetsByType = {};
  relationships.forEach((relationship) => {
    if (!targetsByType[relationship.type]) {
      targetsByType[relationship.type] = [];
    }
    targetsByType[relationship.type].push(relationship.target);
  });

  return {
    findTargetByRelationshipId(relationshipId) {
      return targetsByRelationshipId[relationshipId];
    },
    findTargetsByType(type) {
      return targetsByType[type] || [];
    },
  };
}
