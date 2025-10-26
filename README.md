# useWebStorage

 A React hook for using Web Storage 

> :warning: A project by an amateur. Not production ready!

## Installation

TODO

## Usage

### Basic

For the most basic use you only have to provide the `key`. Optional second argument can be provided with following properties:
- `defaultValue` - if storage is missing the `key` it will be created with this value, optional
- `storageArea` - you can specify which web storage you want to use to store the key, by default `localStorage` is used, available storage areas: `localStorage`, `sessionStorage`


```jsx
const MyComponent = () => {
const { item, setItem, removeItem } = useStorage("item", {
  defaultValue: "something",
  storageArea: window.localStorage,
});
  return (
    <div>
      <p>{item}</p>
      <button onClick={() => setItem("something else")}>Update item</button>
      <button onClick={() => removeItem()}>Delete item</button>
    </div>
    );
};
```


### Outside of React

If you want to change storage items outside of React code but keep it aware of the changes use the storage helper functions:


**Writing to storage**

Use `writeStorage` function with 3 required arguments: `key`, `value`, `storageArea`

```js
writeStorage("hello", "world", window.localStorage);
```

**Reading from storage**

Use `readStorage` function with 2 required arguments: `key`, `storageArea`

```js
const value = readStorage("hello",  window.localStorage);
console.log(value); // "world"
```

**Removing from storage**

Use `removeFromStorage` function with 2 required arguments: `key`, `storageArea`

```js
removeFromStorage("hello", window.localStorage);
```