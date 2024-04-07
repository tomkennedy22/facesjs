import React from "react"
import { faceToSvgString } from "../features/face_utils/faceToSvgString"
import { FaceConfig, Overrides } from "../features/face_utils/types"
import { flattenDict, objStringifyInOrder } from "../features/face_utils/utils";

export const memoizeWithDeepComparison = <Fn extends (...args: any[]) => any>(fn: Fn) => {
    const cache = new Map<string, ReturnType<Fn>>();

    return function (...args: Parameters<Fn>) {
        // Serialize arguments to a string for deep comparison
        const serializedArgs = args.map(arg =>
            typeof arg === 'object' ? objStringifyInOrder(arg) : JSON.stringify(arg)
        ).join(',');

        if (cache.has(serializedArgs)) {
            return cache.get(serializedArgs);
        }

        const result = fn(...args);
        cache.set(serializedArgs, result);
        return result;
    };
};

const faceToSvgStringMemoized = memoizeWithDeepComparison(faceToSvgString);

export const Face: React.FC<{ faceConfig: FaceConfig, overrides?: Overrides, width?: number }> = ({ faceConfig, overrides, width }) => {
    const faceSvg = faceToSvgStringMemoized(faceConfig, overrides);

    console.log('flattenDict', { flattenDictFaceConfig: flattenDict(faceConfig), faceConfig, overrides, width })

    let widthStyle = width ? { width: `${width}px` } : { width: '400px' };
    let heightStyle = width ? { height: `${width * 1.5}px` } : { height: '600px' };

    return (
        <div
            style={{ ...widthStyle, ...heightStyle }}
            dangerouslySetInnerHTML={{ __html: faceSvg }}>
        </div>
    );
};