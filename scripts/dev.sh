#!/usr/bin/env bash
nodemon --watch . --exec 'ts-node index.ts' --ignore '**/*.test.ts'