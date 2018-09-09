import { compose } from "redux";
import { connect } from "react-redux";
import { branch, getContext, withContext, withHandlers, withProps } from 'recompose';
import PropTypes from 'prop-types';
import { withName } from 'reramble';
import { withRouter } from 'react-router-dom';

export function connectRouter() {
  return checkIfPropsContains('match',
    withRouter
  );
}

export function getExistingContext() {
  return compose(
    checkIfPropsContains('existingContext',
      getContext({
        existingContext: PropTypes.object
      })
    )
  );
}

export function checkIfInPropsContextOrOrdered(propInfo, connector, mapStateToProps) {
  return checkIfPropsOrContextContains(propInfo,
    checkIfOrdered(propInfo, connector, mapStateToProps)
  );
}

export function checkIfPropsOrContextContains(propInfo, getterHoc) {
  return checkIfPropsContains(propInfo.name,
    checkIfContextContains(propInfo, getterHoc)
  );
}

export function checkIfPropsContains(propName, getterHoc) {
  return branch(
    (props) => {return !props[propName];},
    getterHoc,
    withName(propName + ' already in props')
  );
}

export function checkIfContextContains(propInfo, getterHoc) {
  var ctx = {};
  ctx[propInfo.name] = propInfo.type;
  return compose(
    getExistingContext(),
    branch(
      (props) => {
        return (props.existingContext && props.existingContext[propInfo.name]);
      },
      compose(
        withName(propInfo.name + ' already in context'),
        getContext(ctx)
      ),
      compose(
        getterHoc,
        setContext(propInfo)
      )
    )
  )
}

function setContext(propInfo) {
  if (propInfo.dontSave) {
    return compose();
  }

  var ctx = {
    existingContext: PropTypes.object
  };
  ctx[propInfo.name] = propInfo.type;
  return withContext(ctx, (props) => {
    let ret = {
      existingContext: {
        ...props.existingContext
      }
    };
    ret.existingContext[propInfo.name] = propInfo.type;
    ret[propInfo.name] = props[propInfo.name];
    return ret;
  });
}

export function getOrderedObjects() {
  return compose(
    checkIfPropsContains('orderedObjects',
      getContext({
        orderedObjects: PropTypes.object
      })
    )
  );
}

function setOrdered(propInfo) {
  let orderedName = propInfo.getOrderedName || (() => propInfo.name);
  return compose(
    withProps((props) => {
      var ret = {};
      ret.orderedObjects = props.orderedObjects || {};
      ret.orderedObjects[orderedName(props)] = true;
      return ret;
    }),
    withContext({
        orderedObjects: PropTypes.object
      },
      ({orderedObjects}) => ({orderedObjects})
    )
  );
}

export function checkIfOrdered(propInfo, connector, mapStateToProps) {
  let orderedName = propInfo.getOrderedName || (() => propInfo.name);
  return compose(
    // connect(mapStateToProps),
    // branch(
    //   (props) => {
    //     return !props[propInfo.name]
    //   },
    //   compose(
    //     withName('ordering ' + propInfo.name),
        connector,
        connect(mapStateToProps)
    // )
  );
}
