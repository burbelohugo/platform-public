#!/bin/bash
# bash script to deploy all lambda services

# git_mode="false"

# while (( "$#" )); do
#   case "${1}" in
#     -h|--help) echo -n "./deploy.sh --stage <STAGE> [--all]"; exit;;

#     --stage) STAGE=$2; shift; shift;;
#     --all) all_mode="true"; shift; shift;;

#     *) echo "fatal: unknown argument '${1}'"; exit 1;;
#   esac
# done

# if [[ ${all_mode} == "true" ]]
# then

cd ../backend

STAGE=$1

# for dir in `ls`; do
for dir in admin chats expo mobile projects schedule teams tracking users; do
    cd $dir
    echo "########### Deploying $dir service for stage $STAGE...."
    # 1. `sls deploy -s $STAGE`     deploy serverless stack in given stage
    # 2. `&> .....deploy-$dir.txt`  redirect serverless output to a file
    # 3. `echo "...."`              print message after we're done
    # 4. `&` at the end             run in background (parallelize deployments)
    sls deploy -s $STAGE &> ../../scripts/tmp/deploy-$dir.txt &
    echo ""
    cd ..
done

wait

# else
#   cd ../backend
#   for dir in `git diff --dirstat=files,0 HEAD~1 -- ./backend`; do
#     cd $dir
#     echo "########### Deploying $dir service for stage $STAGE...."
#     sls deploy -s $STAGE
#     echo "########### Finished deploying $dir service for stage $STAGE...."
#     cd ..
#   done
# fi
