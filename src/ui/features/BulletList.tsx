import React from 'react';

type IBulletListProps = {
    title: string;
    bullets: string[];
    description?: string;
}

export const BulletList = (props:IBulletListProps) => {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl text-gray-900 font-semibold">{props.title}</h2>
            {props.description && (<p>{props.description}</p>)}
            <ol className="list-disc pl-6">
                {props.bullets.map((el, i) => (
                    <li key={`bullet-list-${i}`}>
                        {el}
                    </li>
                ))}
            </ol>
        </div>
    )
}