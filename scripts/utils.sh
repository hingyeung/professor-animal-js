function build_artefact_name {
    SNAPSHOT=`test -z "$(git status --porcelain)" || echo '-snapshot'`
    git log -1 --pretty=format:"%h${SNAPSHOT}"
}

function s3_key_from_build {
    local build=$1
    echo "professor-animal/src/ProfAnimalLambdaFunc-${build}.zip"
}
