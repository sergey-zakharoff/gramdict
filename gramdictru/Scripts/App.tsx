﻿import * as React from "react";
import * as ReactDOM from "react-dom";
import { reaction } from "mobx";
import { SearchBox } from "./SearchBox";
import { ResultsBox } from "./ResultsBox";
import { ApplicationState } from "./ApplicationState";
import { Loader } from "./Loader/index";
import { FilterControl } from "./FilterControl";
import { Filters } from "./Filters";
import { observer } from "mobx-react";

const applicationState = new ApplicationState();
const root = document.documentElement;

const initialTerm = window["term"];
const initialSymbol = window["symbol"];

if (typeof initialTerm !== "undefined" && typeof initialSymbol !== "undefined") {
    console.log("Loading with initial state", initialTerm, initialSymbol);
    applicationState.applyState(initialTerm, initialSymbol);
}

window.onpopstate = function (event) {
    if (event.state === null) {
        applicationState.resetSearch();
        resize();
        return;
    }

    const { term, filters } = event.state;
    if (typeof term === "string" && typeof filters === "string") {
        applicationState.applyState(term, filters);
    }
};

reaction(
    () => applicationState.hasSearched,
    (_, reaction) => {
        console.log("Searching has happened, removing original page");
        const elements = document.getElementsByClassName("page");
        for (let index = 0; index < elements.length; index++) {
            const currentStyle = (elements[index] as any).style;
            const currentDisplay = currentStyle.display;
            currentStyle.display = (currentDisplay === "") ? "none" : "";
        }
    }
);

reaction(
    () => applicationState.filtersAreOpen,
    (_, __) => {
        setTimeout(() => {
            const newHeight = (document.getElementsByClassName("search-bar")[0].getElementsByClassName("centerer")[0] as HTMLElement)
                    .offsetHeight;
            root.style.setProperty("--search-bar-height", `${newHeight}px`);
        });
    });

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

export function resize() {
    const elements = document.getElementsByClassName("page");
    const first: any = elements[0];
    if (!!first) {
        const toCenter = document.getElementsByClassName("centerer");
        for (let index = 0; index < toCenter.length; index++) {
            (toCenter[index] as any).style.width = `${first.offsetWidth}px`;
        }
    }
}

window.addEventListener('resize', debounce(resize, 20, false));

@observer
class MyComponent extends React.Component {
    render() {
        return [
            <div className="search-bar">
                <div className="centerer">
                    <div className="search-controls">
                        <SearchBox applicationState={applicationState} />
                        {applicationState.hasSearched && <FilterControl applicationState={applicationState}/>}
                        <a className="contents-link" href="/contents">Содержание</a>
                    </div>
                    {applicationState.filtersAreOpen && <Filters applicationState={applicationState} />}
                </div>
                <Loader applicationState={applicationState} />
            </div>,
            <ResultsBox applicationState={applicationState}/>
        ];
    }
}

ReactDOM.render(<MyComponent />, document.getElementById("search-react-root"));

setTimeout(resize, 0);