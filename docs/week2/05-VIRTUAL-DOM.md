# 05. Virtual DOM 구현하기

> **React 개념**: Virtual DOM, Reconciliation, Diffing
> **난이도**: ⭐⭐⭐⭐⭐ (매우 어려움)
> **예상 시간**: 10-12시간

## 🎯 이번 단계의 목표

React의 핵심인 Virtual DOM과 Diffing 알고리즘을 직접 구현합니다.

### 구현할 기능
- ✅ Virtual DOM 생성 (`createElement`)
- ✅ Diffing 알고리즘 (변경 감지)
- ✅ Patching (최소한의 DOM 업데이트)
- ✅ Key 기반 리스트 최적화

---

## 📚 배경 지식

### Virtual DOM이란?

Real DOM은 느리고 비용이 많이 듭니다. Virtual DOM은 가벼운 JavaScript 객체로 DOM을 표현하여:

1. **변경 사항을 메모리에서 계산** (빠름)
2. **최소한의 변경만 Real DOM에 적용** (효율적)

```javascript
// Virtual DOM 구조
{
  type: 'div',
  props: {
    className: 'container',
    onClick: handleClick
  },
  children: [
    {
      type: 'h1',
      props: {},
      children: ['Hello']
    }
  ]
}
```

---

## 🏗️ 구현 단계

### Step 1: VNode 생성 함수 (2시간)

**파일 생성**: `src/core/vdom/createElement.js`

```javascript
// h() 함수 (hyperscript)
export function h(type, props = {}, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat().map(child =>
      typeof child === 'object' ? child : createTextNode(child)
    )
  };
}

// 텍스트 노드
function createTextNode(text) {
  return {
    type: 'TEXT',
    props: {},
    children: [],
    text: String(text)
  };
}

// 사용 예시
const vnode = h('div', { className: 'container' },
  h('h1', {}, 'Hello'),
  h('p', {}, 'World')
);
```

---

### Step 2: VNode를 Real DOM으로 변환 (2시간)

**파일 생성**: `src/core/vdom/render.js`

```javascript
export function render(vnode) {
  if (vnode.type === 'TEXT') {
    return document.createTextNode(vnode.text);
  }

  // 요소 생성
  const el = document.createElement(vnode.type);

  // Props 설정
  Object.entries(vnode.props).forEach(([key, value]) => {
    setAttribute(el, key, value);
  });

  // 자식 요소 렌더링
  vnode.children
    .map(render)
    .forEach(childEl => el.appendChild(childEl));

  return el;
}

function setAttribute(el, key, value) {
  if (key.startsWith('on')) {
    // 이벤트 핸들러
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value);
  } else if (key === 'className') {
    el.className = value;
  } else if (key === 'style' && typeof value === 'object') {
    Object.assign(el.style, value);
  } else {
    el.setAttribute(key, value);
  }
}
```

---

### Step 3: Diffing 알고리즘 (4시간)

**파일 생성**: `src/core/vdom/diff.js`

```javascript
export function diff(oldVNode, newVNode) {
  const patches = [];

  // 노드 타입 변경
  if (!oldVNode) {
    patches.push({ type: 'CREATE', newVNode });
  } else if (!newVNode) {
    patches.push({ type: 'REMOVE' });
  } else if (changed(oldVNode, newVNode)) {
    patches.push({ type: 'REPLACE', newVNode });
  } else if (newVNode.type !== 'TEXT') {
    // Props 변경 감지
    const propPatches = diffProps(oldVNode.props, newVNode.props);
    if (propPatches.length > 0) {
      patches.push({ type: 'UPDATE_PROPS', props: propPatches });
    }

    // 자식 노드 비교
    const childPatches = diffChildren(oldVNode.children, newVNode.children);
    if (childPatches.length > 0) {
      patches.push({ type: 'UPDATE_CHILDREN', children: childPatches });
    }
  }

  return patches;
}

function changed(node1, node2) {
  return (
    typeof node1 !== typeof node2 ||
    (node1.type === 'TEXT' && node1.text !== node2.text) ||
    node1.type !== node2.type
  );
}

function diffProps(oldProps, newProps) {
  const patches = [];

  // 변경 및 추가된 props
  Object.keys(newProps).forEach(key => {
    if (oldProps[key] !== newProps[key]) {
      patches.push({ type: 'SET_PROP', key, value: newProps[key] });
    }
  });

  // 제거된 props
  Object.keys(oldProps).forEach(key => {
    if (!(key in newProps)) {
      patches.push({ type: 'REMOVE_PROP', key });
    }
  });

  return patches;
}

function diffChildren(oldChildren, newChildren) {
  const patches = [];
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    patches.push(diff(oldChildren[i], newChildren[i]));
  }

  return patches;
}
```

---

### Step 4: Patching (DOM 업데이트) (3시간)

**파일 생성**: `src/core/vdom/patch.js`

```javascript
import { render } from './render.js';
import { setAttribute } from './render.js';

export function patch(parent, patches, index = 0) {
  if (!patches || patches.length === 0) return;

  const el = parent.childNodes[index];

  patches.forEach(patch => {
    switch (patch.type) {
      case 'CREATE':
        parent.appendChild(render(patch.newVNode));
        break;

      case 'REMOVE':
        parent.removeChild(el);
        break;

      case 'REPLACE':
        parent.replaceChild(render(patch.newVNode), el);
        break;

      case 'UPDATE_PROPS':
        patchProps(el, patch.props);
        break;

      case 'UPDATE_CHILDREN':
        patchChildren(el, patch.children);
        break;
    }
  });
}

function patchProps(el, propPatches) {
  propPatches.forEach(propPatch => {
    if (propPatch.type === 'SET_PROP') {
      setAttribute(el, propPatch.key, propPatch.value);
    } else if (propPatch.type === 'REMOVE_PROP') {
      el.removeAttribute(propPatch.key);
    }
  });
}

function patchChildren(parent, childPatches) {
  childPatches.forEach((patches, index) => {
    patch(parent, patches, index);
  });
}
```

---

### Step 5: Key 기반 리스트 최적화 (2시간)

```javascript
// src/core/vdom/diff.js에 추가

function diffChildren(oldChildren, newChildren) {
  const patches = [];

  // Key가 있는 경우
  const oldKeyed = keyChildren(oldChildren);
  const newKeyed = keyChildren(newChildren);

  if (Object.keys(oldKeyed).length > 0) {
    return diffKeyedChildren(oldKeyed, newKeyed, oldChildren, newChildren);
  }

  // Key가 없는 경우 (기존 로직)
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLength; i++) {
    patches.push(diff(oldChildren[i], newChildren[i]));
  }

  return patches;
}

function keyChildren(children) {
  const keyed = {};
  children.forEach((child, index) => {
    if (child.props && child.props.key) {
      keyed[child.props.key] = { child, index };
    }
  });
  return keyed;
}

function diffKeyedChildren(oldKeyed, newKeyed, oldChildren, newChildren) {
  const patches = [];
  const moves = [];

  // 이동, 추가, 삭제 감지
  newChildren.forEach((newChild, newIndex) => {
    const key = newChild.props?.key;

    if (key && oldKeyed[key]) {
      const oldIndex = oldKeyed[key].index;
      if (oldIndex !== newIndex) {
        moves.push({ type: 'MOVE', from: oldIndex, to: newIndex, key });
      }
      patches[newIndex] = diff(oldKeyed[key].child, newChild);
    } else {
      patches[newIndex] = { type: 'CREATE', newVNode: newChild };
    }
  });

  // 삭제된 아이템
  Object.keys(oldKeyed).forEach(key => {
    if (!newKeyed[key]) {
      const index = oldKeyed[key].index;
      patches[index] = { type: 'REMOVE' };
    }
  });

  return { patches, moves };
}
```

---

### Step 6: 실전 적용 (1시간)

```javascript
// src/main.js
import { h } from './core/vdom/createElement.js';
import { render } from './core/vdom/render.js';
import { diff } from './core/vdom/diff.js';
import { patch } from './core/vdom/patch.js';

class App {
  constructor() {
    this.state = {
      products: [],
      loading: true
    };

    this.oldVNode = null;
    this.rootEl = document.getElementById('root');
  }

  async init() {
    // 초기 렌더링
    this.render();

    // 데이터 로드
    const data = await getProducts();
    this.state.products = data.products;
    this.state.loading = false;

    // 재렌더링
    this.render();
  }

  render() {
    const newVNode = this.view();

    if (!this.oldVNode) {
      // 첫 렌더링
      this.rootEl.appendChild(render(newVNode));
    } else {
      // Diff & Patch
      const patches = diff(this.oldVNode, newVNode);
      patch(this.rootEl, patches);
    }

    this.oldVNode = newVNode;
  }

  view() {
    return h('div', { className: 'app' },
      h('h1', {}, 'Product List'),

      this.state.loading
        ? h('div', { className: 'loading' }, 'Loading...')
        : h('div', { className: 'product-list' },
            ...this.state.products.map(product =>
              h('div', {
                className: 'product-card',
                key: product.id
              },
                h('img', { src: product.thumbnail }),
                h('h3', {}, product.title),
                h('p', {}, `$${product.price}`)
              )
            )
          )
    );
  }
}

const app = new App();
app.init();
```

---

## ✅ 체크리스트

### VNode 생성
- [ ] `h()` 함수 동작
- [ ] 중첩된 요소 생성
- [ ] Props 전달

### 렌더링
- [ ] VNode를 Real DOM으로 변환
- [ ] 이벤트 핸들러 연결
- [ ] 스타일 적용

### Diffing
- [ ] 노드 타입 변경 감지
- [ ] Props 변경 감지
- [ ] 자식 노드 변경 감지
- [ ] Key 기반 최적화

### Patching
- [ ] CREATE 동작
- [ ] REMOVE 동작
- [ ] REPLACE 동작
- [ ] UPDATE_PROPS 동작
- [ ] 최소한의 DOM 조작

---

## 🐛 디버깅 팁

### 성능 측정
```javascript
console.time('diff');
const patches = diff(oldVNode, newVNode);
console.timeEnd('diff');

console.time('patch');
patch(rootEl, patches);
console.timeEnd('patch');
```

### 시각화
```javascript
function visualizeDiff(patches) {
  console.group('Patches');
  patches.forEach((patch, i) => {
    console.log(`[${i}]`, patch.type, patch);
  });
  console.groupEnd();
}
```

---

## 📖 추가 학습 자료

- [Build Your Own React](https://pomb.us/build-your-own-react/)
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Virtual DOM and Internals](https://react.dev/reference/react-dom/server/renderToString)

---

다음: **[06-HOOKS.md - 고급 Hooks 구현하기](./06-HOOKS.md)** →
