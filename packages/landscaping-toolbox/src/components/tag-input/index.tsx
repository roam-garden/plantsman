import ReactTags, {Tag} from "react-tag-autocomplete"
import React from "react"

// TODO!!! how does one add css without webpack
// https://stackoverflow.com/questions/41336858/how-to-import-css-modules-with-typescript-react-and-webpack
// import './tag-input.css'
// const _ = require("./tag-input.css")
// todo need to copy it https://github.com/microsoft/TypeScript/issues/30835

interface TagInputProps {
    tags: Tag[]
    setTags: (tags: Tag[]) => void
    minTags?: number
    maxTags?: number
    disabled?: boolean
}

function getClassNames(tags: Tag[], minTags: number, disabled: boolean | undefined) {
    if (disabled) return tagInputClassesDisabled

    return tags.length >= minTags ? tagInputClasses : tagInputClassesInvalid
}

export const TagInput = ({tags, setTags, minTags = 0, maxTags, disabled, ...restProps}: TagInputProps) => (<ReactTags
    tags={tags}
    onAddition={(tag) => [setTags([...tags, tag])]}
    onDelete={(i) => {
        if (!disabled) setTags([...tags.slice(0, i), ...tags.slice(i + 1)])
    }}
    allowNew={true}
    classNames={getClassNames(tags, minTags, disabled)}
    inputAttributes={{disabled: disabled || (maxTags && tags.length >= maxTags)}}
    addOnBlur
    removeButtonText={disabled ? "" : undefined}
    {...restProps}
/>)

// todo migrate to https://github.com/i-like-robots/react-tags/pull/229 when merged
export const tagInputClasses = {
    root: 'react-tags',
    rootFocused: 'is-focused',
    selected: 'react-tags__selected',
    selectedTag: 'react-tags__selected-tag',
    selectedTagName: 'react-tags__selected-tag-name',
    search: 'react-tags__search',
    searchWrapper: 'react-tags__search-wrapper',
    searchInput: 'react-tags__search-input',
    suggestions: 'react-tags__suggestions',
    suggestionActive: 'is-active',
    suggestionDisabled: 'is-disabled',
    suggestionPrefix: 'react-tags__suggestion-prefix',
}

export const tagInputClassesInvalid = {
    ...tagInputClasses,
    root: `${tagInputClasses.root} is-invalid`,
}

export const tagInputClassesDisabled = {
    ...tagInputClasses,
    root: `${tagInputClasses.root} is-disabled`,
}
